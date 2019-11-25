//
//  BATContributionInfoMigrationPolicy.m
//  CoreDataHolder
//
//  Created by Kyle Hickinson on 2019-11-25.
//  Copyright © 2019 Kyle Hickinson. All rights reserved.
//

#import "BATContributionInfoMigrationPolicy.h"

#import <string>

@interface BATContributionInfoMigrationPolicy ()
@property (nonatomic, assign) NSInteger idCount;
@end

@implementation BATContributionInfoMigrationPolicy

- (double)amountFromProbi:(NSString *)probi
{
  const size_t size = probi.length;
  std::string amount = "0";
  if (size > 18) {
    amount = probi.UTF8String;
    amount.insert(size - 18, ".");
  }
  return std::stod(amount);
}

- (BOOL)beginEntityMapping:(NSEntityMapping *)mapping manager:(NSMigrationManager *)manager error:(NSError *__autoreleasing  _Nullable *)error
{
  self.idCount = 0;
  return [super beginEntityMapping:mapping manager:manager error:error];
}

- (BOOL)createDestinationInstancesForSourceInstance:(NSManagedObject *)sInstance entityMapping:(NSEntityMapping *)mapping manager:(NSMigrationManager *)manager error:(NSError *__autoreleasing  _Nullable *)error
{
  
}

@end
