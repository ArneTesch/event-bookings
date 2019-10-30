import React from "react";
import "./spinner.scss";

export const Spinner = () => (
  <div className="spinner">
    <div className="lds-ripple">
      <div></div>
      <div></div>
    </div>
  </div>
);

export default Spinner;
