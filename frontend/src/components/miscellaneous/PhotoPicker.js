import React from 'react'
// import { ReactDOM } from 'react';
import { createPortal } from "react-dom";

const PhotoPicker = ({ onChange }) => {
    const component = (
        <input type="file" hidden id="photo-picker" onChange={onChange} />
    );

    return createPortal(
        component,
        document.getElementById('photo-picker-element')
    );
}

export default PhotoPicker;