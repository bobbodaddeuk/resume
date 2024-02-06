const options = {
   definition: {
      failOnErrors: true,
      openapi: "3.0.0",
      info: {
         title: "Resume",
         version: "1.0.0",
         description: "이력서 API",
      },
   },
   apis: ["./routers/*.js"], // files containing annotations as above
};

export default options;
