declare module "iiif-processor" {
  namespace IIIF {
    class Error {
      constructor(message: string, params: { statusCode: number });
    }
  }
  class Processor {
    constructor(
      url: string,
      streamImageFromFile: (params: { id: string }) => any
    );
    execute: () => Promise<any>;
  }
}
