export class GameError extends Error {
  constructor(message, code = 'INVALID_ACTION', status = 409) {
    super(message);
    this.code = code;
    this.status = status;
  }
}
