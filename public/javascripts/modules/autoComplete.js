function autoComplete(input, latInput, lngInput) {
  if(!input) return; // skip this fn from running if there is no input on page
  const dropdown = new google.maps.places.Autocomplete(input);

  dropdown.addListener('place_changed', () => {
    const place = dropdown.getPlace();
    latInput.value = place.geometry.location.lat();
    lngInput.value = place.geometry.location.lng();
  });
  // if someone hits enter on the address field, don't submite form
  input.on('keydown', e => {
    e.keyCode === 13 && e.preventDefault();
  })
}

export default autoComplete;