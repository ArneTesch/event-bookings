import React from "react";
import "./bookingsControl.scss";

export interface BookingsControlProps {
  changeOutputTypeHandler(type: string): void;
  activeOutputType: string;
}

const BookingsControl: React.StatelessComponent<
  BookingsControlProps
> = props => {
  const { changeOutputTypeHandler, activeOutputType } = props;
  return (
    <div className="bookingsControl">
      <button
        className={activeOutputType === "list" ? "active" : ""}
        onClick={() => changeOutputTypeHandler("list")}
      >
        List
      </button>
      <button
        className={activeOutputType === "chart" ? "active" : ""}
        onClick={() => changeOutputTypeHandler("chart")}
      >
        Chart
      </button>
    </div>
  );
};
export default BookingsControl;
