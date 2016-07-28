import { Mongo } from 'meteor/mongo';
export const Mat = new Mongo.Collection('mat');
for(i=0; i<64; i++){
	Mat.insert({lit: "false"})
}