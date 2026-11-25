import test from 'node:test';
import assert from 'node:assert/strict';
import {connectRoom} from '../../public/battle14/connection.js';

test('the phone reconnects with the same pending command ID and drops gameplay input until resynchronized',async()=>{
  const originals=new Map();
  const add=(key,value)=>{originals.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{configurable:true,writable:true,value});};
  const sockets=[];
  class TestSocket {
    static OPEN=1;
    static CLOSED=3;
    constructor(){this.sent=[];this.readyState=0;this.bufferedAmount=0;sockets.push(this);}
    opened(){this.readyState=1;this.onopen();}
    receive(message){this.onmessage({data:JSON.stringify(message)});}
    send(payload){this.sent.push(JSON.parse(payload));}
    close(code,reason){this.readyState=3;this.onclose?.({code,reason});}
  }
  add('WebSocket',TestSocket);
  add('location',new URL('http://localhost:3418'));
  add('document',new EventTarget());add('window',new EventTarget());
  let remote;
  try{
    const states=[],errors=[];
    remote=connectRoom({pin:'12345',token:'device',onStatus:s=>states.push(s),onError:m=>errors.push(m)});
    const first=sockets[0];first.opened();
    assert.deepEqual(first.sent[0],{type:'auth',token:'device'});
    first.receive({type:'state',state:{phase:'quiz'}});
    const promised=remote.action({type:'student:submit',questionId:'q01',answer:'B'});
    const submitted=first.sent.find(m=>m.type==='action');
    first.close(1006,'Offline');
    remote.input({dx:1,dz:0,yaw:0,fire:true});
    window.dispatchEvent(new Event('online'));
    const second=sockets[1];second.opened();second.receive({type:'state',state:{phase:'shootout'}});
    assert.deepEqual(second.sent.find(m=>m.type==='action'),submitted);
    second.receive({type:'ack',id:submitted.id});await promised;
    assert.ok(!second.sent.some(m=>m.type==='input'));
    second.receive({type:'arena',frame:{round:1,paused:false,finished:false,players:[]}});
    remote.input({dx:0,dz:1,yaw:0,fire:true});
    const fired=second.sent.find(m=>m.type==='input');
    assert.equal(fired.round,1);assert.ok(fired.fireId);
    second.close(4009,'Another tab controls this device');
    window.dispatchEvent(new Event('online'));
    assert.equal(sockets.length,2);assert.equal(errors.length,1);
    assert.ok(states.includes('offline'));
  }finally{
    remote?.close();
    for(const [key,descriptor] of originals){
      if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];
    }
  }
});

