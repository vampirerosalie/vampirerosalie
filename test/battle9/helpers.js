import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {setImmediate} from 'node:timers/promises';
import {MarketGame} from '../../app/battle9/core/game.js';
export const bank=JSON.parse(readFileSync(new URL('../../app/battle9/data/questions.json',import.meta.url),'utf8'));
export const lots=JSON.parse(readFileSync(new URL('../../app/battle9/data/lots.json',import.meta.url),'utf8'));
export function setup(n=3){
 let now=1000000;const game=new MarketGame({bank,lots,now:()=>now,random:()=>0}),host=game.create();
 // Fixed fixture for existing item-specific mechanics tests. Randomization has
 // separate tests using real creation without overriding the saved order.
 game.room(host.pin).auctionOrder=lots.map((_,i)=>i);
 const clients=Array.from({length:n},(_,i)=>({clientId:randomUUID(),teamSlot:i+1,name:'Team '+(i+1)}));
 const teams=clients.map(c=>game.join(host.pin,c)),act=(token,type,more={},requestId=randomUUID())=>game.action(host.pin,token,{type,requestId,...more});
 return{game,host,teams,clients,act,tick:ms=>{now+=ms;},room:()=>game.room(host.pin),view:token=>game.state(host.pin,token)};
}
export function confirm(s,q){for(const t of s.teams){s.act(t.teamToken,'pupil:submit',{questionId:q,answer:bank[q-1].correct});s.act(s.host.hostToken,'host:review',{questionId:q,teamId:t.teamId,decision:'accepted'});}s.act(s.host.hostToken,'host:confirm',{questionId:q});}
export function open(s,index=0){const r=s.room();r.questionIndex=[2,4,6,8,10,12,14,16,18,20,22,24,25][index]-1;r.phase='question';r.confirmed.push(r.questionIndex+1);r.auctions=Array.from({length:index},(_,i)=>({index:i,status:'unsold',id:randomUUID(),bids:[]}));s.act(s.host.hostToken,'host:open-auction',{questionId:r.questionIndex+1});return s.room().auction.id;}
export class TestD1{
 constructor(){this.sqlite=new DatabaseSync(':memory:');this.sqlite.exec('PRAGMA foreign_keys=ON');this.conflicts=0;this.failAfterCommit=false;}
 prepare(sql){const owner=this;let args=[];return{bind(...values){args=values;return this;},async first(){await setImmediate();return owner.sqlite.prepare(sql).get(...args)??null;},async all(){await setImmediate();return{results:owner.sqlite.prepare(sql).all(...args)};},async run(){await setImmediate();const r=owner.sqlite.prepare(sql).run(...args);if(sql.includes('UPDATE market_rooms')){if(!r.changes)owner.conflicts++;else if(owner.failAfterCommit){owner.failAfterCommit=false;throw new Error('Lost response after commit');}}return{meta:{changes:Number(r.changes)}};}};}
 async batch(statements){this.sqlite.exec('BEGIN');try{const r=[];for(const s of statements)r.push(await s.run());this.sqlite.exec('COMMIT');return r;}catch(e){this.sqlite.exec('ROLLBACK');throw e;}}
 room(pin){return JSON.parse(this.sqlite.prepare('SELECT state_json FROM market_rooms WHERE pin=?').get(pin).state_json);}
 setRoom(room){this.sqlite.prepare('UPDATE market_rooms SET state_json=?,version=? WHERE pin=?').run(JSON.stringify(room),room.version,room.pin);}
}
