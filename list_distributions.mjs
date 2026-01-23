import { CloudFrontClient, ListDistributionsCommand } from '@aws-sdk/client-cloudfront';
const cf = new CloudFrontClient({ region: 'us-east-1' });
try {
  const r = await cf.send(new ListDistributionsCommand({}));
  console.log('Distributions:');
  r.DistributionList?.Items?.forEach(d => {
    console.log(`${d.Id} - ${d.DomainName} - ${d.Aliases?.Items?.join(', ')}`);
  });
} catch (e) {
  console.error(e);
}