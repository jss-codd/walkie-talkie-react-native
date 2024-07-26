import { configureStore } from '@reduxjs/toolkit'

import settingsSlice from './features/settings'
import profileSlice from './features/profile'
import routeSlice from './features/route'
import markerSlice from './features/markers'

export default configureStore({
    reducer: {
        settings: settingsSlice,
        profile: profileSlice,
        route: routeSlice,
        markers: markerSlice,
    },
})