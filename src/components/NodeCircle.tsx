import React from "react";
import "./style.css";

import { networkStore } from "..";
import Node, { NodeProminency } from "../objects/network/Node";

export const NodeCircle: React.FunctionComponent<{ node: Node }> = ({ node }) => {


    return <div>
        <div className={node.isProminent() === NodeProminency.StronglyProminent ? "circleRed" : node.isProminent() == NodeProminency.WeaklyProminent ? "circleYellow" : "circle"}>
            <p className="text">{node.Id}</p>
        </div>
    </div>;
};
