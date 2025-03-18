-- Create the referrals table
create table referrals (
  id bigserial primary key,
  fullname text not null,
  email text not null,
  phone text not null,
  image_url text not null,
  created_at timestamp with time zone default now() not null
);

-- Add a comment to the table
comment on table referrals is 'Stores user referral information including uploaded images'; 