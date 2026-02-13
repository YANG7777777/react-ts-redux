import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';


export const counterSlice = createSlice({
    name: 'counter',
    initialState: {
        value: 0,
        menuCollapsed: false,
    },
    reducers: {
        increment: (state) => {
            state.value += 1;
        },
        decrement: (state) => {
            state.value -= 1;
        },
        // 新增一个 reducer 来切换菜单的折叠状态
        toggleMenuCollapsed: (state, action: PayloadAction<boolean>) => {
            state.menuCollapsed = action.payload;
        },
    },
});

export const { increment, decrement, toggleMenuCollapsed } = counterSlice.actions;
export default counterSlice.reducer;
