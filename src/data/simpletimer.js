let _gc = 0;

export default class SimpleTimer {
  constructor(op) {
    this.counter = _gc++;
    this.start = Date.now();
    console.log(`TId:${this.counter} ${op}`);
  }
  stop(op) {
    const timeMs = Date.now() - this.start;
    console.log(`TId:${this.counter} ${op} Total Duration:${timeMs}ms`);
  }
  log(op) {
    const timeMs = Date.now() - this.start;
    console.log(`TId:${this.counter} ${op} after ${timeMs}ms`);
  }
}
