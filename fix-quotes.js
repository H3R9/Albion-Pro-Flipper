const fs = require('fs');
const file = 'components/refining/RefiningDashboard.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(/"Item Value Code"/g, '&quot;Item Value Code&quot;');
data = data.replace(/"30.000 Foco Cap"/g, '&quot;30.000 Foco Cap&quot;');
data = data.replace(/"Trainee Craftsman"/g, '&quot;Trainee Craftsman&quot;');
data = data.replace(/"Journeyman Refiner"/g, '&quot;Journeyman Refiner&quot;');
data = data.replace(/"Edição"/g, '&quot;Edição&quot;');
data = data.replace(/"Cheios de terceiros e Vendedores"/g, '&quot;Cheios de terceiros e Vendedores&quot;');
data = data.replace(/"Spec-Nodes"/g, '&quot;Spec-Nodes&quot;');

fs.writeFileSync(file, data);
console.log('Fixed quotes');
