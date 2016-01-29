import hms from './hms_core.js';
import _ from 'lodash';

function main () {
  console.log('\n---\n');
  console.log(hms());
}

_.times(10, main);
