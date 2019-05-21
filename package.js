Package.describe({
  name: 'perfectsofttunisia:autoform-upload-file',
  version: '1.0.0',
  summary: 'Upload Files',
  git: 'https://github.com/benbahrikhawla/autoform-upload-file',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2');

  api.use(['ecmascript', 'templating', 'reactive-var', 'mongo', 'underscore', 'random'], 'client');

  api.use('aldeed:autoform@4.0.0 || 5.0.0 || 6.0.0', {weak: true});
  api.use('perfectsofttunisia:autoform@4.0.0 || 5.0.0 || 6.0.0', {weak: true});

  api.addFiles([
    'upload-file.html',
    'upload-file.js',
    'input-type-config.js',
    'upload-file.css',
  ], 'client');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('perfectsofttunisia:autoform-upload-file');
  api.mainModule('autoform-upload-file-tests.js');
});