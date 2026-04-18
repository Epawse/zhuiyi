export interface MapMarker {
  id: string
  lat: number
  lng: number
  label: string
  photoId: string
}

export interface MapRoute {
  markers: MapMarker[]
  polyline: [number, number][]
}