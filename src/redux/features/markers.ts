import { createSlice } from '@reduxjs/toolkit'

const defaultState: { userMarkers: any[], cameraMarkers: any[], actionIconMarkers: any[] } = {
    userMarkers: [],
    cameraMarkers: [],
    actionIconMarkers: []
}

export const markerSlice = createSlice({
    name: 'markers',
    initialState: defaultState,
    reducers: {
        setUserMarker: (state, action) => {
            state.userMarkers = action?.payload
        },

        setCameraMarker: (state, action) => {
            state.cameraMarkers = action?.payload
        },
        resetCameraMarker: (state) => {
            state.cameraMarkers = []
        },
        appendCameraMarker: (state, action) => {
            state.cameraMarkers = [...state.cameraMarkers, action?.payload]
        },

        setActionIconMarker: (state, action) => {
            state.actionIconMarkers = action?.payload
        },
        appendActionIconMarker: (state, action) => {
            state.actionIconMarkers = [...state.actionIconMarkers, action?.payload]
        },
        resetActionIconMarker: (state) => {
            state.actionIconMarkers = []
        },
    },
})


// Action creators are generated for each case reducer function
export const { setUserMarker, setCameraMarker, setActionIconMarker, resetCameraMarker, appendCameraMarker, appendActionIconMarker, resetActionIconMarker } = markerSlice.actions

export const userMarkers = (state: { markers: { userMarkers: any[] } }) => state.markers.userMarkers;
export const cameraMarkers = (state: { markers: { cameraMarkers: any } }) => state.markers.cameraMarkers;
export const actionIconMarkers = (state: { markers: { actionIconMarkers: any[] } }) => state.markers.actionIconMarkers;

export default markerSlice.reducer