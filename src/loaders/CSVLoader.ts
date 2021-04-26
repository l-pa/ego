import { Loader } from "./Loader";
import Network from "../objects/network/Network";
import Node from "../objects/network/Node";
import parse from "csv-parse/lib/sync";

export class CSVLoader extends Loader {
  public async GetNetwork(directed?: boolean) {
    const network = new Network([], [], directed);

    await fetch(super.GetUrl()).then(
      (res) =>
        res.text().then((text) => {          
          const parsed = parse(text, {
            delimiter: ";",
            columns: false,
            skip_empty_lines: true,
          });
          console.log(parsed);
          if (parsed[2]) {
            
            parsed.forEach((element: any) => {
              network.addEdge(
                new Node(element[0]),
                new Node(element[1]),
                Number.parseFloat(element[2])
              );
            });
          } else {            
              parsed.forEach((element: any) => {
                network.addEdge(
                  new Node(element[0]),
                  new Node(element[1]),
                  1
                );
              });
            }
        })
      /*
      res.json().then((data) => {
        data.edges.forEach((element: any) => {
          network.addEdge(
            new Node(element.source),
            new Node(element.target),
            element.size
          );
        });
        
      })*/
    );

    return network;
  }
}
