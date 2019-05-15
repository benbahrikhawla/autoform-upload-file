let AutoForm;

if (Package['aldeed:autoform']) {
    AutoForm = Package['aldeed:autoform'].AutoForm;
} else if (Package['perfectsofttunisia:autoform']) {
    AutoForm = Package['perfectsofttunisia:autoform'].AutoForm;
} else {
    throw new Meteor.Error('You need to add an autoform package');
}

AutoForm.addInputType('uploadFile', {
    template: 'afUploadFile',
    valueOut: function() {
      return this.val();
    },
    valueConverters: {
      string: function(val) {
        if(val && val[0]) {
          return val[0];
        }
      },
      stringArray: function(val) {
        return val;
      },
      number: function(val) {
        return parseInt(val);
      },
      numberArray: function(val) {
        return [parseInt(val)];
      }
    },
});