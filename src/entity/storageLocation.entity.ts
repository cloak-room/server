/*import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Item } from "./item.entity";

@Entity()
export class StorageLocation {
  @PrimaryGeneratedColumn()
  readonly id!: number;

  @Column({ type: "varchar" })
  name!: string;

  @OneToMany(() => Item, (item) => item.storageLocation)
  items: Item[] | undefined;
}
*/
