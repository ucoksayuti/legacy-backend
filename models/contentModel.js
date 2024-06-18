import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            require: [true, "Please insert the title"]
        },
        introduction: {
            type: String,
            require: [true, "Please insert the introduction"]
        },
        source: {
            type: String,
            require: [true, "Please insert the source"]
        },
        story: {
            type: String,
            require: [true, "Please insert the story"]
        },
        image: {
            type: [String],
            validate: {
                validator: function(v) {
                    return v.length <= 5;
                },
                message: "You can only upload up to 5 images."
            },
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Content = mongoose.model("Content", contentSchema);

export default Content;
