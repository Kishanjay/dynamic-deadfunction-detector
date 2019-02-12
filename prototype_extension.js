String.prototype.insert = function (index, string) {
    if (index > 0)
      return this.substring(0, index) + string + this.substring(index, this.length);
    else
      return string + this;
};

String.prototype.splice = function(index, count, add) {
  if (index < 0) {
    index = this.length + index;
    if (index < 0) {
      index = 0;
    }
  }
  return this.slice(0, index) + (add || "") + this.slice(index + count);
}