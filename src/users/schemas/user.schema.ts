import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserProject } from './../../user-projects/schemas/user-project.schema';

export type UserDocument = User & Document;

@Schema({ versionKey: false, timestamps: true })
export class User {
  @Prop({ required: true })
  _id: string;

  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  company: string;

  @Prop([UserProject])
  projects: UserProject[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
