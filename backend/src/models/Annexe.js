const mongoose = require('mongoose');
const slugify = require('slugify');

const annexeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    fileOriginalName: {
      type: String,
    },
    fileSize: {
      type: Number, // in bytes
    },
    fileType: {
      type: String, // mime type
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: [
        'Documentation',
        'Code Source',
        'Schémas',
        'Captures d\'écran',
        'Vidéos',
        'Rapports',
        'Données',
        'Autre',
      ],
      default: 'Autre',
    },
    qrCodeUrl: {
      type: String, // Base64 Data URL of the QR code
    },
    annexePageUrl: {
      type: String, // Full URL to access the annexe
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    downloads: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug before saving
annexeSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
      locale: 'fr',
    });
  }
  next();
});

// Indexes for search performance
annexeSchema.index({ slug: 1 });
annexeSchema.index({ category: 1 });
annexeSchema.index({ isActive: 1 });
annexeSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Annexe', annexeSchema);
