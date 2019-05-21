import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
import {Random} from 'meteor/random';
import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {_} from 'meteor/underscore';
import Dropzone from 'dropzone';

const defaultInsertOpts = {
  meta: {},
  isBase64: false,
  transport: 'ddp',
  streams: 'dynamic',
  chunkSize: 'dynamic',
  allowWebWorkers: true
};

Template.afUploadFile.onCreated(function () {
  const self = this;
  if (!this.data) {
    this.data = {
      atts: {}
    };
  }

  // primary method: use dburles:mongo-collection-instances
  
  if (Mongo.Collection.get) {
    const mongoCollection = Mongo.Collection.get(this.data.atts.collection);
    this.collection = mongoCollection && mongoCollection.filesCollection;
  }

  // 1. fallback using global scope
  if (!this.collection) {
    this.collection = global[this.data.atts.collection];
  }

  // 2. fallback using Meteor.connection / local collections
  // if the Meteor release is newer than 2016 -> use _stores
  // else use older _mongo_livedata_collections
  // see https://github.com/meteor/meteor/pull/5845
  if (!this.collection) {
    const storedCollection =  Meteor.connection._stores[this.data.atts.collection];
    this.collection = (storedCollection && storedCollection._getCollection)
      ? storedCollection._getCollection().filesCollection
      : Meteor.connection._mongo_livedata_collections[this.data.atts.collection];
  }

  if (!this.collection) {
    throw new Meteor.Error(404, `[meteor-autoform-files] No collection found by name "${this.data.atts.collection}"`,
      `Collection's name is case-sensetive. Please, make sure you're using right collection name.`);
  }

  this.insertConfig    = Object.assign({}, this.data.atts.insertConfig || {});
  delete this.data.atts.insertConfig;
  this.insertConfig    = Object.assign(this.insertConfig, _.pick(this.data.atts, Object.keys(defaultInsertOpts)));

  if (!isNaN(this.insertConfig.streams) || this.insertConfig.streams !== 'dynamic') {
    this.insertConfig.streams = parseInt(this.insertConfig.streams);
  }
  if (!isNaN(this.insertConfig.chunkSize) || this.insertConfig.chunkSize !== 'dynamic') {
    this.insertConfig.chunkSize = parseInt(this.insertConfig.chunkSize);
  }

  this.collectionName = function () {
    return self.data.atts.collection;
  };
  this.currentUpload = new ReactiveVar(false);
  this.filesId = new ReactiveVar(this.data.value || []);
  this.filesLink = new ReactiveVar([]);
  let id = this.data.atts ? (this.data.atts.id || Math.random().toString(36).substring(7)) : Math.random().toString(36).substring(7); 
  this.id = 'file' + id
  return;
});

Template.afUploadFile.onRendered(function() {
   
    let template = Template.instance();
    let id = '#' + this.id;
    this.dropzone = new Dropzone(id, {
        autoDiscover: false,
        autoProcessQueue: false,
        uploadMultiple: true,
        clickable: id + ' .uploadButton',
        url() {
            return 'https://fakeurl.com'
        }, 
        addedfile: (file) => {
            if (file) {
                let filesLink = template.filesLink.get();
                filesLink.push({linkId: Random.id(), link: file});
                template.filesLink.set(filesLink);

                filesLink.forEach((file) => {
                    let reader = new FileReader();
                    reader.onload = function (e) {
                        $('#' + file.linkId).attr('src', e.target.result);
                    }
                    reader.readAsDataURL(file.link);
                });

                const opts = Object.assign({}, defaultInsertOpts, template.insertConfig, {
                  file
                });
          
                const upload = template.collection.insert(opts, false);

                upload.on('start', function () {
                    template.currentUpload.set(this);
                    return;
                });
          
                upload.on('error', function (error) {
                    template.$(e.currentTarget).val('');
                    return;
                });
          
                upload.on('end', function (error, fileObj) {
                    if (!error) {
                    let filesId = template.filesId.get();
                    filesId.push(fileObj._id);
                    template.filesId.set(filesId);
                    }
                    template.currentUpload.set(false);
                    template.filesLink.set([]);
                    return;
                });
                upload.start();
            }
        }
    });
});

Template.afUploadFile.helpers({
    schemaKey() {
        if (this.atts) {
            return this.atts['data-schema-key'];
        }
    },
    id() {
        return Template.instance().id;
    },
    currentUpload() {
        return Template.instance().currentUpload.get();
    },
    filesId() {
        return Template.instance().filesId.get() || this.value;
    },
    filesLink() {
        return Template.instance().filesLink.get();
    }
});

Template.afUploadFile.events({
    'click #deletePicture'(event, instance) {
        event.preventDefault();
        let fileId = instance.$(event.currentTarget).data('file');
        if (fileId) {
            let filesId = instance.filesId.get();
            let index = filesId.indexOf(fileId);
            if (index > -1) {
                filesId.splice(index, 1);
                instance.filesId.set(filesId);
            }
            if (instance.data.value) {
                let index = instance.data.value.indexOf(fileId);
                if (index > -1) {
                    instance.data.value.splice(index, 1);
                }
            }
            try {
                instance.collection.remove({_id: fileId});
            } catch (error) {
            }
            return false;
        }
    }
});


Template.afUploadFile.onDestroyed(function() {
    if(this.dropzone) {
        this.dropzone.destroy();
        this.dropzone = null;
    }
})