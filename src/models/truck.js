import { model, Schema } from 'mongoose';

const schema = new Schema({
  driverId: { type: Number, required: [true, 'driverId is required'] },
  status: { type: String, required: [true, 'status is required'] },
  geolocation: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
    },
  },
});
schema.index({ location: '2dsphere' });
export const Truck = model('Truck', schema);
