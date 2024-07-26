import { createSlice } from '@reduxjs/toolkit'
import { ProfileDetailsInterface } from '../../../types'

const profileDefault = {
    details: {
        name: "",
        email: "",
        mobile: "",
        location: "",
        profile_img: "",
        id: 0
    }
}

export const profileSlice = createSlice({
    name: 'profile',
    initialState: profileDefault,
    reducers: {
        setProflieDetails: (state, action) => {
            state.details = { ...state.details, ...action?.payload }
        },
    },
})


// Action creators are generated for each case reducer function
export const { setProflieDetails } = profileSlice.actions

export const proflieDetails = (state: { profile: { details: ProfileDetailsInterface } }) => state.profile.details;

export default profileSlice.reducer