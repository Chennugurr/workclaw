'use client';

import { useState, useEffect } from 'react';
import {
  CaretSortIcon,
  CheckIcon,
  PlusCircledIcon,
} from '@radix-ui/react-icons';
import { toast } from 'sonner';
import axios from '@/lib/axios';
import { cn } from '@/lib/utils';
import { ACTIONS } from '@/store/constants';
import { useAppDispatch, useAppState } from '@/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { TOAST_IDS } from '@/constants';

const createOrgSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum([
    'STARTUP',
    'SMALL_BUSINESS',
    'CORPORATION',
    'NON_PROFIT',
    'GOVERNMENT',
    'EDUCATIONAL',
    'HEALTHCARE',
    'FINTECH',
    'ECOMMERCE',
    'TECHNOLOGY',
    'CONSULTING',
    'OTHER',
  ]),
  teamSize: z.enum([
    'ONE_TO_TEN',
    'ELEVEN_TO_FIFTY',
    'FIFTY_ONE_TO_TWO_HUNDRED',
    'TWO_HUNDRED_ONE_TO_FIVE_HUNDRED',
    'FIVE_HUNDRED_ONE_TO_ONE_THOUSAND',
    'OVER_ONE_THOUSAND',
  ]),
});

export default function OrganizationSwitcher({ className }) {
  const { organization: org } = useAppState();
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [showNewOrgDialog, setShowNewOrgDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(createOrgSchema),
    defaultValues: {
      name: '',
      type: '',
      teamSize: '',
    },
  });

  useEffect(() => {
    dispatch({ type: ACTIONS.ORGANIZATIONS.FETCH });
  }, [dispatch]);

  const handleOrgSelect = (orgId) => {
    dispatch({ type: ACTIONS.ORGANIZATIONS.SELECT, payload: orgId });
    setOpen(false);
  };

  const onSubmit = async (data) => {
    if (isLoading) return;
    setIsLoading(true);
    const toastId = toast.loading('Creating organization...', {
      id: TOAST_IDS.CREATE_ORGANIZATION,
    });
    try {
      const res = await axios.post('/orgs', data);
      if (res.data.status === 'success') {
        await dispatch({ type: ACTIONS.ORGANIZATIONS.FETCH });
        setShowNewOrgDialog(false);
        form.reset();
        toast.success('Organization created successfully', { id: toastId });
        handleOrgSelect(res.data.data.id);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          'Failed to create organization. Please try again.',
        { id: toastId }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={showNewOrgDialog} onOpenChange={setShowNewOrgDialog}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={open}
            aria-label='Select an organization'
            className={cn('w-full justify-between', className)}
            disabled={isLoading}
          >
            <Avatar className='mr-2 h-5 w-5'>
              <AvatarImage
                src={
                  org.selected.logo ||
                  `https://avatar.vercel.sh/${org.selected.id}.png`
                }
                alt={org.selected.name}
                className='grayscale'
              />
              <AvatarFallback>
                {org.selected.name?.charAt(0) || 'O'}
              </AvatarFallback>
            </Avatar>
            {org.selected.name || 'Select Organization'}
            <CaretSortIcon className='ml-auto h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-full p-0'>
          <Command>
            <CommandInput placeholder='Search organization...' />
            <CommandList>
              <CommandEmpty>No organization found.</CommandEmpty>
              <CommandGroup heading='Organizations'>
                {org.items.map((o) => (
                  <CommandItem
                    key={o.id}
                    onSelect={() => handleOrgSelect(o.id)}
                    className='text-sm'
                    disabled={isLoading}
                  >
                    <Avatar className='mr-2 h-5 w-5'>
                      <AvatarImage
                        src={o.logo || `https://avatar.vercel.sh/${o.id}.png`}
                        alt={o.name}
                        className='grayscale'
                      />
                      <AvatarFallback>{o.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {o.name}
                    <CheckIcon
                      className={cn(
                        'ml-auto h-4 w-4',
                        org.selected?.id === o.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                <DialogTrigger asChild>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false);
                      setShowNewOrgDialog(true);
                    }}
                    disabled={isLoading}
                  >
                    <PlusCircledIcon className='mr-2 h-5 w-5' />
                    Create Organization
                  </CommandItem>
                </DialogTrigger>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
          <DialogDescription>
            Add a new organization to manage jobs.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Acme Inc.'
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select organization type' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='STARTUP'>Startup</SelectItem>
                      <SelectItem value='SMALL_BUSINESS'>
                        Small Business
                      </SelectItem>
                      <SelectItem value='CORPORATION'>Corporation</SelectItem>
                      <SelectItem value='NON_PROFIT'>Non-Profit</SelectItem>
                      <SelectItem value='GOVERNMENT'>Government</SelectItem>
                      <SelectItem value='EDUCATIONAL'>Educational</SelectItem>
                      <SelectItem value='HEALTHCARE'>Healthcare</SelectItem>
                      <SelectItem value='FINTECH'>Fintech</SelectItem>
                      <SelectItem value='ECOMMERCE'>E-commerce</SelectItem>
                      <SelectItem value='TECHNOLOGY'>Technology</SelectItem>
                      <SelectItem value='CONSULTING'>Consulting</SelectItem>
                      <SelectItem value='OTHER'>Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='teamSize'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team size</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select team size' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='ONE_TO_TEN'>1-10</SelectItem>
                      <SelectItem value='ELEVEN_TO_FIFTY'>11-50</SelectItem>
                      <SelectItem value='FIFTY_ONE_TO_TWO_HUNDRED'>
                        51-200
                      </SelectItem>
                      <SelectItem value='TWO_HUNDRED_ONE_TO_FIVE_HUNDRED'>
                        201-500
                      </SelectItem>
                      <SelectItem value='FIVE_HUNDRED_ONE_TO_ONE_THOUSAND'>
                        501-1000
                      </SelectItem>
                      <SelectItem value='OVER_ONE_THOUSAND'>1000+</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setShowNewOrgDialog(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
