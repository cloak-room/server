import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Item } from "./item.entity";

@Entity()
export class ItemType {
  @PrimaryGeneratedColumn()
  readonly id!: number;

  @Column({ type: "varchar" })
  name!: string;

  @Column({ type: "int" })
  price!: number;

  @OneToMany(() => Item, (item) => item.itemType)
  items: Item[] | undefined;
}
