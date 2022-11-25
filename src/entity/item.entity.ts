import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { ItemType } from "./itemType.entity";
import { User } from "./user.entity";

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  readonly id!: number;

  @ManyToOne(() => User, (user) => user.items)
  @JoinColumn()
  user!: User;

  @Column({ type: "varchar" })
  ownerName!: string;

  @ManyToOne(() => ItemType, (itemType) => itemType.items)
  @JoinColumn()
  itemType!: ItemType;

  @Column({ type: "varchar", nullable: false })
  storageLocation!: string;

  @Column({ type: "varchar", nullable: true })
  ownerPhoneNumber!: string;

  @Column({ type: "varchar", nullable: true })
  comments?: string;

  @CreateDateColumn()
  createdAt?: Date;
}
