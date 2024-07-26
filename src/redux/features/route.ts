import { createSlice } from '@reduxjs/toolkit'

const defaultState = {
    selectedRoute: {},
    routeItems: []
}

export const routeSlice = createSlice({
    name: 'route',
    initialState: defaultState,
    reducers: {
        setRoute: (state, action) => {
            state.selectedRoute = action?.payload
        },
        setRouteItems: (state, action) => {
            state.routeItems = action?.payload
        },
    },
})


// Action creators are generated for each case reducer function
export const { setRoute, setRouteItems } = routeSlice.actions

export const selectedRoute = (state: { route: { selectedRoute: any } }) => state.route.selectedRoute;
export const routeItems = (state: { route: { routeItems: any[] } }) => state.route.routeItems;

export default routeSlice.reducer