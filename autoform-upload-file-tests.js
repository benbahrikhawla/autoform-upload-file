// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by autoform-upload-file.js.
import { name as packageName } from "meteor/perfectsofttunisia:autoform-upload-file";

// Write your tests here!
// Here is an example.
Tinytest.add('autoform-upload-file - example', function (test) {
  test.equal(packageName, "autoform-upload-file");
});
