import { model, Schema } from 'mongoose';

const schema = new Schema({
  driverId: { type: Number, required: [true, 'driverId is required'] },
  status: { type: String, required: [true, 'status is required'] },
  geolocation: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
      default: [0, 0],
    },
  },
});
schema.index({ geolocation: '2dsphere' });
export const Truck = model('Truck_test', schema);
