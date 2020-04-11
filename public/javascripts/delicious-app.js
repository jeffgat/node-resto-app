import '../sass/style.scss';

import { $, $$ } from './modules/bling';
import autoComplete from './modules/autoComplete';
import typeAhead from './modules/typeAhead';
import makeMap from './modules/map';
import ajaxHeart from './modules/heart';

autoComplete( $('#address'), $('#lat'), $('#lng') );

typeAhead( $('.search') );
// $ querySelector
// $$ querySelectorAll

makeMap( $('#map') );

const heartForms = $$('form.heart');
heartForms.on('submit', ajaxHeart);