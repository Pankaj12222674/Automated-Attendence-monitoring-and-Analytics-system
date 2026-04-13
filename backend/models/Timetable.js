import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema({

day:{
type:String,
required:true
},

time:{
type:String,
required:true
},

subjectId:{
type:mongoose.Schema.Types.ObjectId,
ref:"Subject",
required:true
},

classId:{
type:mongoose.Schema.Types.ObjectId,
ref:"Class",
required:true
},

teacherId:{
type:mongoose.Schema.Types.ObjectId,
ref:"User",
required:true
}

},{timestamps:true})

export default mongoose.model("Timetable",timetableSchema)