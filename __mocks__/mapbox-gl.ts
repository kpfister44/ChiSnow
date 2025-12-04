// ABOUTME: Mock for Mapbox GL JS to enable testing in jsdom environment
// ABOUTME: Provides stub implementations of Map and NavigationControl classes

const mapboxgl = {
  accessToken: '',
  Map: class Map {
    remove() {}
    addControl() {}
  },
  NavigationControl: class NavigationControl {},
};

export default mapboxgl;
