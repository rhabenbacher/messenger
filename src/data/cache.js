export default class CacheNewestDate {
  constructor(maxSize) {
    this.maxSize = maxSize;
    this.minDate = new Date('2999-12-31');
    this.minDateKey = '';
    this.cache = new Map();
  }

  _deleteMinDateEntry() {
    console.log(`Delete cache entry with Key ${this.minDateKey}`);
    this.cache.delete(this.minDateKey);
    let minDate = new Date('2999-12-31');
    let minDateKey = ''
    this.cache.forEach((value, key) => { minDate = (value.creationDate < minDate) ? (minDateKey = key, value.creationDate) : minDate });
    this.minDate = minDate;
    this.minDateKey = minDateKey;
    console.log(`Next entry for deletion Key: ${this.minDateKey} Date: ${this.minDate} `);
  }

  get(key) {
    const cacheEntry = this.cache.get(key);
    return (cacheEntry) ? cacheEntry.data : undefined;
  }

  set(key, data, creationDate) {
    const dataObj = { data, creationDate };
    this.minDate = (creationDate < this.minDate) ? (this.minDateKey = key, creationDate) : this.minDate;
    this.cache.set(key, dataObj);
    if (this.cache.size > this.maxSize) {
      this._deleteMinDateEntry();
    }
  }
}