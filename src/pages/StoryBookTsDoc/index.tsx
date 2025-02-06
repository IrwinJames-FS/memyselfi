import { Paper, Stack, Typography } from "@mui/material";
import { Layout } from "../../components";

export default function CraftyCalc() {
  return (
    <Layout>
      <Paper sx={{ mx: { md: "5rem"}, padding: "1rem",'.MuiTypography-root':{my: '1rem'} }}>
        <Typography variant="h3">Storybook addon ts-doc</Typography>
        <Typography>This addon was born from my work on <a href="/shapley">Shapley</a>. I wanted to use storybook because I like the way it provides interactive examples of UI components. That being said I found storybook has no support for automated documentation of non ui components. To address this I found a couple addons that allow you to see the AST type and comments of top level declarations. However, I wanted something that would be a bit more dynamic and provide highly traversable documentation. I used <a href="https://storybook.js.org/addons/storybook-addon-jsdoc-to-mdx">jsdoc-to-mdx</a> as a reference and found I liked <a href="https://ts-morph.com/">ts-morph</a> over trying to interface with <a href="https://tsdoc.org/">ts-doc</a>. Ts-morph does a lot of the heavy lifting when it comes to linking and getting the data out of the different types of nodes.</Typography>
        <Typography>The typescript compiler creates nodes or tokens for every declaration, expression, and statment using javascript and typescript syntax based the tsconfig file. each node is given a numeric value called the syntaxKind, which is so named because it indicates the kind of syntax item the node represents. each syntaxKind has different capabilities therefore the logic used to document the node needs to also be based on that syntax kind value. To achieve this I built a delegator around the syntaxKind values. The delegator is open ended in that it is used to determine which nodes are used to create a new file and used again to handle building the signatures for the declarations.</Typography>
        <Typography variant="subtitle1">Plans</Typography>
        <ul>
          <li><Typography>true HMR support. I am working with the storybook team and other addon developers. In order to accomplish this goal its my understanding that storybooks csf support for doc only pages would need to be reworked. In the meantime I do use an independent file watcher to trigger updates when files are modified. If new documentation files are created or deleted however the storybook dev server will need to be restarted to see the changes.</Typography></li>
          <li><Typography>Modular UI. I would like to set up an interface where custom templates can be proved for different declaration types so that the documentation UI can match the theme or aesthetic of the project.</Typography></li>
          <li><Typography>File based css overrides. Currently "theme" colors can be modified via the config file however it would be more convenient to accept a path to a css file. using @layers I think I could just import the new file normally and the @layered css will have lower precedence.</Typography></li>
          <li><Typography>Improved titles and signatures. This might be as simple as using a custom font in the titles but functions and syntax characters dont look great. If I can find a font where the parenthesis and brackets have a bit more body it might look better. I am also exploring having a sort of color coded titling so differnciating between declaration types is simpler.</Typography></li>
          <li><Typography>Improved naming. Currently I am trying to gain a better understanding of how storybook handles names and duplicate names. because file paths are case insensitive two declarations both the same except for case results in a sort of (1)...(2) convention. I am exploring different ways to handle this case because it is common convention to have a class CustomClass and an instance customClass. The difference is succinctly illustrated by the change of case. Idealy I would like to find a method that changes the title of the documentation page enough that storybook does not complain about a duplicate title while visibly only displaying the changed case. (I havent explored this much but suspect uri safe characters that wont be removed by trim will work.) </Typography></li>
        </ul>
      </Paper>
    </Layout>
  );
}
