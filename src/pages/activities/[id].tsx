import { Box, Center } from '@chakra-ui/react';
import { Role } from '@prisma/client';
import EditActivitiesCard from 'components/activities/EditActivitiesCard';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const EditTeam = () => {
  const { data: userData, status } = useSession();
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (status === 'authenticated' && userData.user.role !== Role.ADMIN) {
      router.push('/');
    }

    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status]);

  return (
    <Center as="main" bg="black" py={12} flexDir="column">
      <Box
        p={8}
        pt={12}
        bg="gray.800"
        rounded="md"
        flexDirection="column"
        maxW="80%"
        m="0 auto"
        width="100%"
      >
        <EditActivitiesCard activityId={id?.toString()} />
      </Box>
    </Center>
  );
};

export default EditTeam;