const communityShema= new mongoose.Schema({
community_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    icon: { type: String },  // optional (emoji or image)
    memberCount: { type: Number, default: 0 },
}, { timestamps: true });

export const Community= mongoose.model('Community',communityShema);