export class PropertyAPIFeatures {
  constructor(mongooseQuery, queryString) {
    this.query = mongooseQuery;
    this.queryString = queryString || {};
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search', 'lng', 'lat', 'distance'];
    excludedFields.forEach((el) => delete queryObj[el]);

    if (queryObj.amenities && typeof queryObj.amenities === 'string') {
      queryObj.amenities = { $all: queryObj.amenities.split(',') };
    }

    if (queryObj.guests) {
      queryObj.maxGuests = { $gte: Number(queryObj.guests) };
      delete queryObj.guests;
    }

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this; // <--- MUST RETURN this
  }

  search() {
    if (this.queryString.search && this.queryString.search.trim() !== '') {
      this.query = this.query.find({
        $or: [
          { title: { $regex: this.queryString.search, $options: 'i' } },
          { 'location.city': { $regex: this.queryString.search, $options: 'i' } },
        ],
      });
    }
    return this; // <--- MUST RETURN this
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this; // <--- MUST RETURN this
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this; // <--- MUST RETURN this
  }

  paginate() {
    const page = Math.max(1, parseInt(this.queryString.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(this.queryString.limit, 10) || 12));
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this; // <--- MUST RETURN this
  }
}