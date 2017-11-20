/*drop table if exists callbacks;
drop type if exists callback_type;*/
CREATE TYPE callback_type AS ENUM ('data/uplink', 'data/downlink', 'service/geoloc');

create table if not exists callbacks(
  id serial primary key,
  date timestamp not null,
  type callback_type not null,
  device varchar(10) not null,
  data varchar(24),
  stationId varchar(10),
  rssi float,
  duplicate boolean
);
