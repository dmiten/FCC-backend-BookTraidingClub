"use strict";

import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate";

const bookSchema = new mongoose.Schema({
        accepted: String,
        details: {
          authors: [],
          description: String,
          googleId: String,
          isbn: [],
          publisher: String,
          publisherDate: String,
          thumbnail: String,
          title: String,
        },
        owner: String,
        trades: []
      },
      { timestamps: true });

bookSchema.plugin(mongoosePaginate);

export default mongoose.model("Book", bookSchema);