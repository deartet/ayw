$(document).ready(function() {
    // Comparing with == generates a warining
    if ('testing' === 'testing') {
      console.log($);
    }
  });


function add(num1, num2) {
   // Fixing 'use strict'
    'use strict';
  return num1 + num2;
}