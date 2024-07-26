import { createSlice } from '@reduxjs/toolkit'

const settingsDefault = {
    notificationStatus: true
}

export const settingsSlice = createSlice({
    name: 'settings',
    initialState: settingsDefault,
    reducers: {
        setSettings: (state, action) => {
            state.notificationStatus = action?.payload?.notificationStatus ?? true
        },
    },
})


// Action creators are generated for each case reducer function
export const { setSettings } = settingsSlice.actions

export const notificationStatus = (state: { settings: { notificationStatus: boolean; }; }) => state.settings.notificationStatus;

export default settingsSlice.reducer