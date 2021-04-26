import React from "react";
import "./style.css";

import { networkStore } from "..";
import Node from "../objects/network/Node";

export const NodeCircle: React.FunctionComponent<{ node: Node }> = ({ node }) => {


    return <div>
        <div className={node.isProminent() == 0 ? "circleRed" : node.isProminent() == 1 ? "circleYellow" : "circle"}>
            <p className="text">{node.Id}</p>
        </div>
    </div>;
};
