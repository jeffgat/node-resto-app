const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: 'Please enter a store name!'
    },
    slug: String,
    description: {
        type: String,
        trim: true
    },
    tags: [String],
    created: {
      type: Date,
      default: Date.now
    },
    location: {
      type: {
        type: String,
        default: 'Point'
      },
      coordinates: [{
        type: Number,
        required: 'You must supplying coordinates!'
      }],
      address: {
        type: String,
        required: 'You must supply and address!'
      }
    },
    photo: String,
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: 'You must suppl yan author'
    }
}, {
  toJSON: { virtuals: true }, // virutal relationships on mongodb don't show up in JSON, this can override that
  toObject: { virtuals: true }
});

// define our indexes
storeSchema.index({
  name: 'text',
  description: 'text'
});

storeSchema.index({ location: '2dsphere' });

storeSchema.pre('save', async function(next) {
    if (!this.isModified('name')) {
        next(); // skip it
        return; // stop this function from running
    }
    this.slug = slug(this.name);
    // find other stores that have a slug of wes, wes-1, wes-2
    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i') // 'i' is case INsensitive
    const storesWithSlug = await this.constructor.find({ slug: slugRegEx });

    // TODO make more resiliant so slugs are unique
    if (storesWithSlug.length) {
      this.slug = `${this.slug}-${storesWithSlug.length + 1}`
    }
    next();
});

storeSchema.statics.getTagsList = function() {
  return this.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } }},
    { $sort: { count: -1 }}
  ]);
}

storeSchema.statics.getTopStores = function() {
  return this.aggregate([
    // look up stores and populate their reviews
    { $lookup: {
        from: 'reviews', // mongo takes your model name, lowercases it and adds an s to th end -> Review becomes reviews
        localField: '_id',  // links with foreign
        foreignField: 'store', // links with local
        as: 'reviews' // what we name it as
      }},

    // filter for only items that have 2+ reviews
    { $match: { 'reviews.1': { $exists: true } }},

    // add avg reviews field
    { $project: {
        photo: '$$ROOT.photo',
        name: '$$ROOT.name',
        reviews: '$$ROOT.reviews',
        slug: '$$ROOT.slug',
        averageRating: { $avg: '$reviews.rating' } // create a field called averageRating, set it to the AVERAGE of reviews.rating
    }},

    // sort it by our new field, highest reviews first
    { $sort: { averageRating: -1 }},// -1 means highest to lowest

    // limit to 10
    { $limit: 10 }


  ])
}

// find reviews where stroes _id property === reviews store property
// this is pretty much like a JOIN in SQL
storeSchema.virtual('reviews', {
  ref: 'Review', // what model to link?
  localField: '_id', // which field on the store?
  foreignField: 'store' // which field on the review?
})

function autopopulate(next) {
  this.populate('reviews');
  next();
}

storeSchema.pre('find', autopopulate);
storeSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Store', storeSchema); // naming store and passing in our schema