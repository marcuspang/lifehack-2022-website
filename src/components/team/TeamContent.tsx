import { Box, Flex, Heading, Icon, List, Stack, Text, Tooltip } from '@chakra-ui/react';
import { Team, TeamRequest, User } from '@prisma/client';
import { MdCheckCircle, MdClear } from 'react-icons/md';
import useSWR from 'swr';
import Loader from '../common/Loader';
import InviteTeamMemberButton from './InviteTeamMemberButton';
import LeaveTeamButton from './LeaveTeamButton';
import NoTeamContent from './NoTeamContent';
import MemberDetails from './TeamMemberDetails';

export interface TeamInterface extends Team {
  users: User[];
  teamRequests: (TeamRequest & { requestee: User })[];
}

const TeamContent = () => {
  const { data, isValidating } = useSWR<TeamInterface>('/api/users/team');

  if (isValidating) {
    return <Loader />;
  }

  if (!data) {
    return <NoTeamContent />;
  }

  return (
    <>
      <Flex>
        <Box>
          <Heading as="h2" size="lg" display="inline">
            Team Name
          </Heading>
          <Text fontSize="xl">{data.name}</Text>
        </Box>
        <Tooltip
          label={'Your team has ' + (data.verified ? '' : 'not') + ' been verified'}
          placement="bottom"
        >
          <span style={{ height: '24px' }}>
            <Icon
              as={data.verified ? MdCheckCircle : MdClear}
              color={data.verified ? 'green.500' : 'red.500'}
              ml={2}
              height="24px"
              width="24px"
            />
          </span>
        </Tooltip>
      </Flex>
      <Stack pt={6}>
        <Heading as="h3" size="md" display="inline">
          Total Points
        </Heading>
        <Text fontSize="xl">{data.points}</Text>
      </Stack>
      <Stack py={6}>
        <Heading size="md" as="h3">
          Members (min 2, max 4)
        </Heading>
        <List spacing={3}>
          {data.users.map((user, index) => (
            <MemberDetails key={index + '.' + user.email} user={user} />
          ))}
        </List>
        <Heading size="md" as="h3" pt={6}>
          <Tooltip label="Any requests sent by your team members will be shown here">
            Sent team requests
          </Tooltip>
        </Heading>
        {data.teamRequests.length && (
          <List>
            {data.teamRequests.map((teamRequest, index) => (
              <MemberDetails
                key={index + '.' + teamRequest.requestee.email}
                user={teamRequest.requestee}
                request={teamRequest}
              />
            ))}
          </List>
        )}
      </Stack>
      <Flex direction={'row-reverse'}>
        <LeaveTeamButton teamId={data.id} />
        <InviteTeamMemberButton teamId={data.id} mr={4} />
      </Flex>
    </>
  );
};

export default TeamContent;