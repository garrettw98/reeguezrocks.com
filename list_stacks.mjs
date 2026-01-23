import { CloudFormationClient, ListStacksCommand } from '@aws-sdk/client-cloudformation';
const cf = new CloudFormationClient({ region: 'us-east-1' });
try {
  const r = await cf.send(new ListStacksCommand({ StackStatusFilter: ['CREATE_COMPLETE', 'UPDATE_COMPLETE'] }));
  console.log('Stacks in us-east-1:');
  console.log(r.StackSummaries.map(s => s.StackName).join('\n'));
} catch (e) {
  console.error(e);
}