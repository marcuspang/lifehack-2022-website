import { EditIcon } from '@chakra-ui/icons';
import {
  Button,
  Editable,
  EditableInput,
  EditablePreview,
  Flex,
  IconButton,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
} from '@chakra-ui/react';
import { Prisma, Team, User } from '@prisma/client';
import { useRouter } from 'next/router';
import { useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import Loader from '../common/Loader';

const EditParticipantsTable = () => {
  const [skip, setSkip] = useState(0);
  const { data, mutate } = useSWR<{
    users: (User & { team: Team | null })[];
    count: number;
  }>('/api/users?skip=' + skip + '&take=10');
  const { mutate: globalMutate } = useSWRConfig();
  const toast = useToast();
  const router = useRouter();

  if (!data) {
    return <Loader />;
  }

  const updateUser = async (params: Prisma.UserUpdateInput & { teamId: string | null }) => {
    try {
      const result = await fetch('/api/users/' + params.id, {
        method: 'PATCH',
        body: JSON.stringify({
          ...params,
        }),
      });
      const data = await result.json();
      if (!result.ok) {
        throw new Error(data.error.message);
      }
      await mutate();
      await globalMutate('/api/teams?skip=0&take=10');
      toast({
        status: 'success',
        title: data.message,
        isClosable: true,
      });
    } catch (error) {
      if (error instanceof Error) {
        toast({
          status: 'error',
          title: 'Error updating user',
          description: error.message,
          isClosable: true,
        });
      } else {
        toast({
          status: 'error',
          title: 'Error updating user',
          isClosable: true,
        });
      }
    }
  };

  return (
    <>
      <TableContainer width="100%">
        <Table variant="unstyled" border="1px solid" borderColor="gray.600">
          <Thead>
            <Tr borderBottom="1px solid" borderColor="gray.600">
              <Th textAlign="center" fontSize={['md', 'md', 'lg']}>
                Name
              </Th>
              <Th textAlign="center" fontSize={['md', 'md', 'lg']}>
                Email
              </Th>
              <Th textAlign="center" isNumeric fontSize={['md', 'md', 'lg']}>
                Points
              </Th>
              <Th textAlign="center" isNumeric fontSize={['md', 'md', 'lg']}>
                Team
              </Th>
              <Th textAlign="center" isNumeric fontSize={['md', 'md', 'lg']}>
                Edit
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.users.map((user) => (
              <Tr
                key={user.id}
                borderBottom="1px solid"
                borderColor="gray.600"
                transition="all 0.1s ease-in-out"
                _hover={{ bg: 'gray.700' }}
              >
                <Td textAlign="center">
                  <Editable
                    defaultValue={user.name!}
                    maxW="fit-content"
                    mx="auto"
                    onSubmit={(name) => updateUser({ id: user.id, name, teamId: user.teamId })}
                  >
                    <EditablePreview />
                    <EditableInput />
                  </Editable>
                </Td>
                <Td textAlign="center">{user.email}</Td>
                <Td textAlign="center">
                  <NumberInput
                    step={1}
                    min={0}
                    defaultValue={user.points}
                    maxW="100px"
                    mx="auto"
                    onBlur={(e) =>
                      updateUser({ id: user.id, points: +e.target.value, teamId: user.teamId })
                    }
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </Td>
                <Td textAlign="center">
                  {user.team?.name && (
                    <Button variant="theme" onClick={() => router.push('/teams/' + user.team?.id)}>
                      {user.team?.name}
                    </Button>
                  )}
                </Td>
                <Td>
                  <IconButton
                    aria-label="Edit team"
                    variant="theme"
                    size="sm"
                    onClick={() => router.push('/users/' + user.id)}
                    icon={<EditIcon />}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      <Flex justifyContent="space-between" pt={6}>
        <Button variant="theme" isDisabled={skip <= 0} onClick={() => setSkip((prev) => prev - 10)}>
          Prev
        </Button>
        <Button
          variant="theme"
          isDisabled={data.count <= skip + 10}
          onClick={() => setSkip((prev) => prev + 10)}
        >
          Next
        </Button>
      </Flex>
    </>
  );
};

export default EditParticipantsTable;